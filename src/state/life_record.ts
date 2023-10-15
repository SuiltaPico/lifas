import { createStore } from "solid-js/store";
import { LifeRecord } from "../interfaces/life_record";
// import { get_records } from "../db/life_record";

const [lifeRecordState, setLifeRecordState] = createStore({
  pageSize: 100,
  curr_page_records: [] as LifeRecord[],
});

// console.log(get_records(1, lifeRecordState.pageSize));

export const useLifeRecordState = () =>
  [lifeRecordState, setLifeRecordState] as const;
