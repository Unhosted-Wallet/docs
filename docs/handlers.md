---
sidebar_position: 8
---

# @unhosted/strategies

pre-built functionalities from the [strategy library](./developers/StrategyGuide)

## Aave V2

[Code](https://github.com/Unhosted-Wallet/unhosted-strategies/blob/main/src/aaveV2/AaveV2Strategy.sol)

| Function                                                                                                         | Description                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deposit(address asset,uint256 amount)`                                                                          | Deposits a certain `amount` of an `asset` into the protocol, minting the same amount of corresponding aTokens, and transferring them to the userSA address.                |
| `depositETH(uint256 amount)`                                                                                     | Deposits a certain `amount` of ETH for WETH and deposits into the protocol, minting the same amount of corresponding aTokens, and transferring them to the userSA address. |
| `withdraw(address asset,uint256 amount)`                                                                         | Withdraws `amount` of the underlying `asset`, i.e. redeems the underlying token and burns the aTokens.                                                                     |
| `withdrawETH(uint256 amount)`                                                                                    | Withdraws `amount` of the WETH and swap it for ETH, i.e. redeems the ETH and burns the aTokens.                                                                            |
| `borrow(address asset,uint256 amount,uint256 rateMode)`                                                          | Borrows `amount` of `asset` with `interestRateMode`, sending the amount to userSA, with the debt being incurred by userSA.                                                 |
| `borrowETH(uint256 amount,uint256 rateMode)`                                                                     | Borrows `amount` of WETH with `interestRateMode`, sending the amount in ETH to userSA, with the debt being incurred by userSA.                                             |
| `repay(address asset,uint256 amount,uint256 rateMode,address onBehalfOf)`                                        | Repays `onBehalfOf`'s debt `amount` of `asset` which has a `rateMode`.                                                                                                     |
| `repayETH(uint256 amount,uint256 rateMode,address onBehalfOf)`                                                   | Repays `onBehalfOf`'s debt `amount` of WETH with ETH which has a `rateMode`.                                                                                               |
| `flashLoan(address[] calldata assets,uint256[] calldata amounts,uint256[] calldata modes,bytes calldata params)` | Sends the requested `amounts` of `assets` to the userSA contract which handles by fallback handler, passing the included `params`.                                         |

## Compound V3

[Code](https://github.com/Unhosted-Wallet/unhosted-strategies/blob/main/src/compoundV3/CompoundV3Strategy.sol)

| Function                                               | Description                                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `supply(address comet,address asset,uint256 amount)`   | Transfers an `amount` of an `asset` to the protocol and adds it to the account’s balance.            |
| `supplyETH(address comet, uint256 amount)`             | Transfers an `amount` of WETH with ETH to the protocol and adds it to the account’s balance.         |
| `withdraw(address comet,address asset,uint256 amount)` | Withdraw collateral that is not currently supporting an open borrow.                                 |
| `withdrawETH(address comet,uint256 amount)`            | Withdraw WETH collateral in ETH that is not currently supporting an open borrow.                     |
| `borrow(address comet,uint256 amount)`                 | Used to borrow the base `asset` from the protocol if the account has supplied sufficient collateral. |
| `borrowETH(address comet,uint256 amount)`              | Used to borrow ETH from the protocol if the account has supplied sufficient collateral.              |
| `repay(address comet,uint256 amount)`                  | Used to repay an open borrow of the base asset.                                                      |
| `repayETH(address comet,uint256 amount)`               | Used to repay an open borrow of the WETH in ETH.                                                     |

## Uniswap V3

[Code](https://github.com/Unhosted-Wallet/unhosted-strategies/blob/main/src/uniswapV3/UniswapV3Strategy.sol)

| Function                                                                                                                             | Description                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `exactInputSingleFromEther(address tokenOut,uint24 fee,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)`         | Swaps`amountIn` of ETH for as much as possible of another token.                                               |
| `exactInputSingleToEther(address tokenIn,uint24 fee,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)`            | Swaps `amountIn` of a token for as much as possible of ETH.                                                    |
| `exactInputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)`  | Swaps `amountIn` of one token for as much as possible of another token.                                        |
| `exactInputFromEther(bytes memory path,uint256 amountIn,uint256 amountOutMinimum)`                                                   | Swaps `amountIn` of ETH for as much as possible of another along the specified path.                           |
| `exactInputToEther(bytes memory path,uint256 amountIn,uint256 amountOutMinimum)`                                                     | Swaps `amountIn` of one token for as much as possible of ETH along the specified path.                         |
| `exactInput(bytes memory path,uint256 amountIn,uint256 amountOutMinimum)`                                                            | Swaps `amountIn` of one token for as much as possible of another along the specified path.                     |
| `exactOutputSingleFromEther(address tokenOut,uint24 fee,uint256 amountOut,uint256 amountInMaximum,uint160 sqrtPriceLimitX96)`        | Swaps as little as possible of ETH for `amountOut` of another token.                                           |
| `exactOutputSingleToEther(address tokenIn,uint24 fee,uint256 amountOut,uint256 amountInMaximum,uint160 sqrtPriceLimitX96)`           | Swaps as little as possible of one token for `amountOut` of ETH.                                               |
| `exactOutputSingle(address tokenIn,address tokenOut,uint24 fee,uint256 amountOut,uint256 amountInMaximum,uint160 sqrtPriceLimitX96)` | Swaps as little as possible of one token for `amountOut` of another token.                                     |
| `exactOutputFromEther(bytes memory path,uint256 amountOut,uint256 amountInMaximum)`                                                  | Swaps as little as possible of ETH for `amountOut` of another token along the specified path (reversed).       |
| `exactOutputToEther(bytes memory path,uint256 amountOut,int256 amountInMaximum)`                                                     | Swaps as little as possible of one token for `amountOut` of ETH along the specified path (reversed).           |
| `exactOutput(bytes memory path,uint256 amountOut,uint256 amountInMaximum)`                                                           | Swaps as little as possible of one token for `amountOut` of another token along the specified path (reversed). |

## Lido.fi

[Code](https://github.com/Unhosted-Wallet/unhosted-strategies/blob/main/src/lido/LidoStrategy.sol)

| Function                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `submit(uint256 value)` | Submits a `value` of ETH for stETH by Lido finance. |
