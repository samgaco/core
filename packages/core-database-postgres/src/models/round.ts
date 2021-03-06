import { Database } from "@arkecosystem/core-interfaces";
import { Utils } from "@nosplatform/crypto";
import { IColumnDescriptor } from "../interfaces";
import { Model } from "./model";

export class Round extends Model {
    protected columnsDescriptor: IColumnDescriptor[] = [
        {
            name: "public_key",
            prop: "publicKey",
            supportedOperators: [Database.SearchOperator.OP_EQ],
        },
        {
            name: "balance",
            prop: "voteBalance",
            init: col => Utils.BigNumber.make(col.value).toFixed(),
            supportedOperators: [
                Database.SearchOperator.OP_EQ,
                Database.SearchOperator.OP_LTE,
                Database.SearchOperator.OP_GTE,
            ],
        },
        {
            name: "round",
            supportedOperators: [
                Database.SearchOperator.OP_EQ,
                Database.SearchOperator.OP_LTE,
                Database.SearchOperator.OP_GTE,
            ],
        },
    ];

    public getTable(): string {
        return "rounds";
    }
}
