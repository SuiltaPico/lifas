import { LifeRecord } from "../interfaces/life_record";
import { generate_crud } from "./core";

export const life_record_db = generate_crud<LifeRecord>("life_record", {
  id: "INTEGER PRIMARY KEY",
  record_tags: "TEXT NOT NULL",
  start_date: "TIMESTAMP",
  end_date: "TIMESTAMP",
  description: "TEXT NOT NULL",
});

