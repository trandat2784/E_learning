import {Kafka} from "kafkajs";

export const kafka = new Kafka({

    brokers: ["d80qsmvtkpdl3h0rutrg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"],
    ssl: true,
    sasl: {
        mechanism: "scram-sha-256",
        username: "trandat",
        password: "elearning5",

    }
});
