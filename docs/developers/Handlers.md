---
sidebar_position: 2
---

# Building Handlers

> :::warning
> Improperly implemented handlers may lead to wallet malfunctions or potential fund losses. During handler development, feel free to reach out to our team for a thorough review before strategy module deployment.

If you haven't read the [introduction](./Introduction), make sure you understand the strategy module development process at a high level first. This document provides a more detailed insight into how a handler can be developed.

### Handler Library

We've introduced a library featuring handlers for various DeFi protocols, designed to simplify development in your handler. This library is consistently updated to incorporate new protocols. Each handler within the library offers key functionalities specific to its associated protocol.
These handlers are designed to work seamlessly with OpenZeppelin contracts v5.

### Installation

#### Hardhat, Truffle (npm)

```bash
npm install @unhosted/handlers  @openzeppelin/contracts
```

#### Foundry (git)

```bash
forge install Unhosted-Wallet/unhosted-modules OpenZeppelin/openzeppelin-contracts
```

Also add

```bash
@unhosted/handlers/=lib/unhosted-modules/defi-strategies/contracts/handlers/
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
```

to `remappings.txt`.

### Usage

After installation, you have the flexibility to utilize the handlers in the library by importing them. You can either build upon existing defi protocol handlers or create your own by inheriting from `BaseHandler.sol`.

Here's an example of a handler that utilizes Aave V2 and Uniswap V3. It initializes them, with Uniswap V3 taking the wrapped ETH address, AaveV2 taking the same wrapped ETH address and aaveV2Provider. Additionally, there's a fallback handler to manage flash loans from Aave V2. You can specify the contract name for use in the marketplace module as the strategy module name.

```js title="/contracts/TestHandler.sol"
pragma solidity ^0.8.20;

import { UniswapV3Handler } from "@unhosted/handlers/uniswapV3/UniswapV3H.sol";
import { AaveV2Handler } from "@unhosted/handlers/aaveV2/AaveV2H.sol";

contract MyStrategy is UniswapV3Handler, AaveV2Handler {
  constructor(
    address wethAddress,
    address uniV3Router,
    address aaveV2Provider,
    address fallbackHandler
  )
    UniswapV3Handler(wethAddress, uniV3Router)
    AaveV2Handler(wethAddress, aaveV2Provider, fallbackHandler)
  {}

  function getContractName()
    public
    pure
    override(UniswapV3Handler, AaveV2Handler)
    returns (string memory)
  {
    return "TestStrategy";
  }
}
```

:::info

1. The functions in handlers operate through `delegatecall` from the user's wallet. Therefore, it's crucial that handlers are developed in a way that avoids altering the wallet storage. State variables should be defined as either `constant` or `immutable` variables, which are stored directly in the deployed bytecode. This means they are not stored at a fixed offset in storage, unlike regular state variables.
2. Certain functionalities in strategies, such as flash loans, require changes to the fallback handlers on the user's wallet. This is why there is a fallback handler storage slot in `BaseHandler.sol` that can be modified based on the functionality, as seen in the example of the AaveV2 handler.
:::

## Next Step

Now you are prepared to [deploy your strategy module](./StratModules) using the Module Factory and start accumulating fees for it.