import { app } from "@arkecosystem/core-container";
import { Blockchain, Database, State } from "@arkecosystem/core-interfaces";
import { formatTimestamp } from "@arkecosystem/core-utils";
import { roundCalculator } from "@arkecosystem/core-utils";
import { Interfaces, Managers, Utils } from "@nosplatform/crypto";

export const transformBlock = (model, transform) => {
    if (!transform) {
        model.reward = Utils.BigNumber.make(model.reward).toFixed();
        model.topReward = Utils.BigNumber.make(model.topReward).toFixed();
        model.totalFee = Utils.BigNumber.make(model.totalFee).toFixed();
        model.removedFee = Utils.BigNumber.make(model.removedFee).toFixed();
        model.totalAmount = Utils.BigNumber.make(model.totalAmount).toFixed();

        return model;
    }

    const databaseService: Database.IDatabaseService = app.resolvePlugin<Database.IDatabaseService>("database");
    const generator: State.IWallet = databaseService.walletManager.findByPublicKey(model.generatorPublicKey);
    const lastBlock: Interfaces.IBlock = app.resolvePlugin<Blockchain.IBlockchain>("blockchain").getLastBlock();
    const topDelegateCount = Managers.configManager.getMilestone(lastBlock.data.height).topDelegates;

    // Get top rewarded delegates
    const roundInfo = roundCalculator.calculateRound(lastBlock.data.height);
    const delegates = databaseService.walletManager.loadActiveDelegateList(roundInfo);
    const topDelegates = [];
    let i = 0;

    for (const delegate of delegates) {
        if (i < topDelegateCount) {
            topDelegates.push({ username: delegate.username, address: delegate.address });
        }
        i++;
    }

    model.reward = Utils.BigNumber.make(model.reward);
    model.topReward = Utils.BigNumber.make(model.topReward);
    model.totalFee = Utils.BigNumber.make(model.totalFee);
    model.removedFee = Utils.BigNumber.make(model.removedFee);

    return {
        id: model.id,
        version: +model.version,
        height: +model.height,
        previous: model.previousBlock,
        forged: {
            reward: model.reward.toFixed(),
            topReward: model.topReward.toFixed(),
            fee: model.totalFee.toFixed(),
            removed: model.removedFee.toFixed(),
            total: model.totalFee
                .plus(model.reward)
                .plus(model.topReward)
                .toFixed(),
            amount: Utils.BigNumber.make(model.totalAmount).toFixed(),
        },
        payload: {
            hash: model.payloadHash,
            length: model.payloadLength,
        },
        generator: {
            username: generator.username,
            address: generator.address,
            publicKey: generator.publicKey,
        },
        signature: model.blockSignature,
        confirmations: lastBlock ? lastBlock.data.height - model.height : 0,
        transactions: model.numberOfTransactions,
        timestamp: formatTimestamp(model.timestamp),
        topDelegates,
    };
};
