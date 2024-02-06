---
sidebar_position: 3
---

# Adding Strategy

If you haven't built your strategy, refer to our example strategy [building guide](./StrategyGuide) for assistance.

## How Strategy Module works

After constructing your strategy, deploy it on a supported network. Use our singleton strategy module on that network to add your strategy by calling `updateStrategy` function and passing your strategy address and the dev address for receiveing the fees.the dev address can always updated by current dev. Different strategies may need distinct interfaces to interact with in the wallet, and we obtain your strategy ABI for creating its interface. Feel free to reach out to us for any improvements in this process.

### Execute Strategy

To execute arbitrary data on the strategy, the strategy module must be enabled, and the transaction must be signed by the Smart Account (SA) owner.

To execute the strategy, `executeStrategy` or `executeTriggeredStrategy` method should be called, which checks the signature or any trigger condition and calls the SA to perform the strategy.

```js
function executeStrategy(
        address smartAccount,
        StrategyTransaction memory _tx,
        bytes memory signatures
    ) public
        payable
        returns (bool executed, uint256 gasUsed, bytes memory returnData);
```

```js
function executeTriggeredStrategy(
        address smartAccount,
        StrategyTransaction memory _tx,
        bytes memory signatures
    ) public
        payable
        returns (bool executed, uint256 gasUsed, bytes memory returnData);
```

- `address` of the smartAccount for execution.

- `_tx` struct including `operation` as type of tx, `strategy` as the strategy address to execute, the `value` to send and `strategyData` to call or delegatecall.

- for triggered execution the `executeTriggeredStrategy` checks if the `trigger` address returns `true` for calling `triggerData` before actual execution.

```objectivec
struct StrategyTransaction {
        Enum.Operation operation;
        address strategy;
        uint256 value;
        bytes strategyData;
}
```

```objectivec
struct TriggeredStrategyTransaction {
        Enum.Operation operation;
        address strategy;
        uint256 value;
        bytes strategyData;
        address trigger;
        bytes triggerData;
}
```

- `signatures` signed by SA owner.

The strategy module signatures are EIP-712 based. And uses the following scheme:

EIP712Domain:

```js
{
  "EIP712Domain": [
    { "type": "string", "name": "name" },
    { "type": "string", "name": "version" },
    { "type": "uint256", "name": "chainId" },
    { "type": "address", "name": "verifyingContract" }
  ]
}
```

ExecuteStrategy:

```js
{
  "ExecuteStrategy": [
    { "type": "Operation", "name": "operation" },
    { "type": "address", "name": "strategy" },
    { "type": "uint256", "name": "value" },
    { "type": "bytes", "name": "strategyData" },
    { "type": "uint256", "name": "nonce" }
  ]
}
```

ExecuteTriggeredStrategy:

```js
{
  "ExecuteTriggeredStrategy": [
    { "type": "Operation", "name": "operation" },
    { "type": "address", "name": "strategy" },
    { "type": "uint256", "name": "value" },
    { "type": "bytes", "name": "strategyData" },
    { "type": "address", "name": "trigger" },
    { "type": "bytes", "name": "triggerData" },
    { "type": "uint256", "name": "nonce" }
  ]
}
```

### Approval Mechanism

However, the module strategy is permissionless, enabling anyone to add their strategy contract and adding them to their wallet, Unhosted incorporates its approval mechanism. This ensures that only modules with verified security measures are provided to our users. Moving forward, we plan to adopt [ERC7484](https://eips.ethereum.org/EIPS/eip-7484) (Registries and Adapters for Smart Accounts) to validate the security of our on-chain strategies. This precaution is in place to prevent the addition of malicious code to users' wallets.
