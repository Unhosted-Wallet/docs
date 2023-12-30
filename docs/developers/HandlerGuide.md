---
sidebar_position: 3
---

# Build Handler By Example

## Swapping Collateral with Compound v3 Handler

:::info
Familiarity with [Compound](https://docs.compound.finance/collateral-and-borrowing/), [Aave](https://docs.aave.com/developers/v/2.0/guides/flash-loans) and [Uniswap](https://docs.uniswap.org/contracts/v3/guides/swaps/single-swaps) documentation is recommended for a comprehensive understanding of the integration.
:::

Explore this tutorial to construct a straightforward DeFi strategy handler for swapping provided collateral to another supported collateral within the Compound v3 protocol. The handler encompasses four steps for executing the collateral swap:

1. Initiate a flash loan for the exact amount of the current collateral from Aave v2.
2. Execute a swap for the precise amount to the targeted collateral token using Uniswap v3.
3. Deposit the new collateral into Compound v3 and withdraw the old collateral.
4. Repay the flash loan to Aave v2 with the withdrawn collateral.

Since the strategy involves a flash loan, a callback handler contract is also required to modify the default callback handler of the wallet during the process.

### 1. Handler Contract

```js title="/contracts/CompV3CollateralSwap.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IComet} from "@unhosted/handlers/compoundV3/CompoundV3H.sol";
import {BaseHandler, IERC20, SafeERC20} from "@unhosted/handlers/BaseHandler.sol";
import {AaveV2Handler, ILendingPoolAddressesProviderV2} from "@unhosted/handlers/aaveV2/AaveV2H.sol";

/**
 * @title Compound v3 collateral swap handler
 * @dev Compatible with Unhosted strategy module
 */
contract CompV3CollateralSwap is AaveV2Handler {
    using SafeERC20 for IERC20;

    address public immutable callbackHandler;

    constructor(address wethAddress, address aaveV2Provider, address callbackHandler_)
        AaveV2Handler(wethAddress, aaveV2Provider, callbackHandler_)
    {
        callbackHandler = callbackHandler_;
    }

    struct ReceiveData {
        address tokenOut;
        address comet;
    }

    /**
     * @dev Executes a collateral swap from the supplied token to another supported collateral token on Compound v3.
     * @param comet Address of the Compound contract used for collateral supply and withdrawal.
     * @param suppliedCollateralToken, Address of the currently supplied collateral token.
     * @param targetCollateralToken, Address of the new collateral token to be supplied.
     * @param collateralAmountToSwap, Amount of the current collateral token to be swapped.
     * @param debtMode, Flashloan mode for Aave (noDebt=0, stableDebt=1, variableDebt=2).
     */
    function collateralSwap(
        address comet,
        address suppliedCollateralToken,
        address targetCollateralToken,
        uint256 collateralAmountToSwap,
        uint256 debtMode
    ) public payable {
        uint256[] memory mode = new uint256[](1);
        uint256[] memory amount = new uint256[](1);
        address[] memory token = new address[](1);
        ReceiveData memory receiveData = ReceiveData(targetCollateralToken, comet);
        mode[0] = debtMode;
        amount[0] = collateralAmountToSwap;
        token[0] = suppliedCollateralToken;
        bytes memory data = abi.encode(receiveData);

        IComet(comet).allow(callbackHandler, true);
        IERC20(suppliedCollateralToken).approve(callbackHandler, collateralAmountToSwap);
        flashLoan(token, amount, mode, data);
        IComet(comet).allow(callbackHandler, false);
        IERC20(suppliedCollateralToken).approve(callbackHandler, 0);
    }

    function getContractName() public pure override(AaveV2Handler) returns (string memory) {
        return "CollateralSwapStrategy";
    }
}
```

#### Explanation

To initialize this contract, the Aave V2 handler from the [library](./Handlers) must be initialized, granting access to its flashloan functionality. The initialization requires the wrapped native token address, the AaveV2 provider address, and the deployed callback handler (discussed later in this [guide](#flashloan-callback-handler-contract)). `collateralSwap` is the main function for this strategy. Ensure familiarity with Compound comet contracts via their documentation [here](https://docs.compound.finance/) to understand how supplying and borrowing works.

**_Parameters_**

**`comet`**: The address of the Compound protocol comet contract with which we intend to engage for supplying and withdrawing collateral.

**`suppliedCollateralToken`**: Address of the currently supplied collateral to the Comet contract.

**`targetCollateralToken`**: Address of the new collateral token to supply.

**`collateralAmountToSwap`**: The amount of supplied collateral (should already be supplied to the comet).

**`mode`**: Flashloan mode for Aave, [learn more here](https://docs.aave.com/developers/v/2.0/guides/flash-loans).

**_Functions_**

The `collateralSwap` function operates the following steps:

1. Prepares parameters for the flashloan, including passing the Comet and new collateral token addresses. This informs the callback handler about the targeted Comet and the token to swap for the new collateral.

2. Allows the callback handler to withdraw and transfer on behalf of the Smart Account (SA), approving it for the transfer of the received borrowed token. This is crucial for the subsequent transfer and swap operations.

3. Calls the flashloan on Aave, triggering a callback to the SA, which then invokes the callback handler for executing operations. In this step, we borrow the `collateralAmountToSwap` from Aave pools.

4. Revokes the given allowances and approvals from the callback handler, ensuring proper cleanup after the flashloan operation.

This process ensures a seamless interaction with Compound and Aave, facilitating collateral swaps efficiently through flashloans.

### 2. Flashloan Callback Handler Contract

```js title="/contracts/FlashloanCallbackHandler.sol"
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/* solhint-disable no-empty-blocks */
import {IFlashLoanReceiver} from "@unhosted/handlers/aaveV2/CallbackHandler.sol";
import {ISwapRouter} from "@unhosted/handlers/uniswapV3/UniswapV3H.sol";
import {IERC20} from "@unhosted/handlers/BaseHandler.sol";
import {IComet} from "@unhosted/handlers/compoundV3/CompoundV3H.sol";

/**
 * @title Collateral swap flashloan callback handler
 * @dev This contract temporarily replaces the default handler of SA during the flashloan process
 */
contract FlashloanCallbackHandler is IFlashLoanReceiver {
    // prettier-ignore
    ISwapRouter public immutable router;

    struct ReceiveData {
        address tokenOut;
        address comet;
    }

    error InvalidInitiator();
    error SwapFailed();

    constructor(address router_) {
        router = ISwapRouter(router_);
    }

    /**
     * @dev Called by SA during the executeOperation of a flashloan
     * @dev Transfers the borrowed tokens from SA, swaps it for new collateral,
     * and supplies the new collateral, then withdraws the previous collateral to repay the loan
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata,
        address initiator,
        bytes calldata data
    ) external virtual returns (bool) {
        if (initiator != msg.sender) {
            revert InvalidInitiator();
        }
        ReceiveData memory decodedData = abi.decode(data, (ReceiveData));
        {
            ISwapRouter.ExactInputSingleParams memory params;

            params.tokenIn = assets[0];
            params.tokenOut = decodedData.tokenOut;
            params.fee = 3000;
            params.recipient = address(this);
            params.amountIn = amounts[0];
            params.amountOutMinimum = 1;
            params.sqrtPriceLimitX96 = 0;
            params.deadline = block.timestamp;

            IERC20(assets[0]).transferFrom(msg.sender, address(this), amounts[0]);

            IERC20(assets[0]).approve(address(router), amounts[0]);
            try router.exactInputSingle(params) {}
            catch {
                revert SwapFailed();
            }
        }

        uint256 newBalance = IERC20(decodedData.tokenOut).balanceOf(address(this));
        IERC20(decodedData.tokenOut).approve(decodedData.comet, newBalance);
        IComet(decodedData.comet).supplyTo(msg.sender, decodedData.tokenOut, newBalance);

        IComet(decodedData.comet).withdrawFrom(
            msg.sender,
            msg.sender, // to
            assets[0],
            amounts[0]
        );

        return true;
    }
}
```

#### Explanation

We initialize this contract with the Uniswap V3 router, which it utilizes for swapping the supplied collateral to the new collateral token.

**_Functions_**

The `executeOperation` function operates in the following steps:

1. Decodes the received data from the flashLoan function to extract the Comet and new collateral token needed for further operations.

2. Upon successfully receiving the `collateralAmountToSwap` from the supplied collateral token in the SA, it transfers the received loan from SA to the callback contract and swaps it using the Uniswap router to the new collateral token.

3. After the successful swap, it approves Comet for supplying the new collateral on behalf of SA and completes the supply operation.

4. Finally, it withdraws the previous collateral on behalf of SA and transfers it to SA itself. This enables SA to repay the flash loan with that amount (if the mode is 0 and no debt will be created).

> :::warning
> **Security considerations**:
>
> - The callback handler initially verifies that the initiator of the flash loan is the SA address.
> - The callback handler reinstates the default fallback handler of SA once the flash loan operations are completed.
> - Approvals granted by SA for repaying the loan, allowances given to the callback handler for withdrawing collateral, and approvals for the callback handler to transfer borrowed tokens are revoked at the conclusion of executed operations.

Explore additional examples of handlers [here](https://github.com/Unhosted-Wallet/unhosted-handlers) to enhance your understanding of various scenarios. Diving into the associated test scripts can provide valuable insights into the logic behind DeFi strategies.
For faster development and efficient testing, we used Foundry. If you are unfamiliar with Foundry, read their [documentation](https://book.getfoundry.sh/) for additional insights.

## Next Step

Now you are prepared to [deploy your strategy module](./StratModules) using the Module Factory and start accumulating fees for it.
