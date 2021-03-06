import { app } from "@arkecosystem/core-container";
import { Container, EventEmitter, Logger } from "@arkecosystem/core-interfaces";
import { roundCalculator } from "@arkecosystem/core-utils";
import { Handlers } from "@nosplatform/core-transactions";
import { q } from "@nosplatform/storage";
import { defaults } from "./defaults";
import { StakeCreateTransactionHandler, StakeRedeemTransactionHandler } from "./handlers";
import * as StakeHelpers from "./helpers";

const emitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    alias: "stake-transactions",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Registering Stake Create Transaction");
        Handlers.Registry.registerCustomTransactionHandler(StakeCreateTransactionHandler);
        container.resolvePlugin<Logger.ILogger>("logger").info("Registering Stake Redeem Transaction");
        Handlers.Registry.registerCustomTransactionHandler(StakeRedeemTransactionHandler);
        emitter.on("block.applied", async block => {
            const isNewRound = roundCalculator.isNewRound(block.height);
            if (isNewRound) {
                q(async () => await StakeHelpers.ExpireHelper.processExpirations(block));
            }
        });
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering Stake Create Transaction");
        Handlers.Registry.deregisterCustomTransactionHandler(StakeCreateTransactionHandler);
        container.resolvePlugin<Logger.ILogger>("logger").info("Deregistering Stake Redeem Transaction");
        Handlers.Registry.deregisterCustomTransactionHandler(StakeRedeemTransactionHandler);
    },
};

export { StakeHelpers, StakeCreateTransactionHandler, StakeRedeemTransactionHandler };
