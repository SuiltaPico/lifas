import { createSignal, children, JSX, Component, For } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { Icon } from "@iconify-icon/solid";
import plusIcon from "@iconify/icons-mdi/plus";
import searchIcon from "@iconify/icons-mdi/search";
import { IconifyIcon } from "iconify-icon";
import { createStore } from "solid-js/store";
import { useLifeRecordState } from "./state/life_record";
import { life_record_db } from "./db/life_record";

const SearchBar: Component<{ class?: string }> = (props) => {
  return (
    <div class={`flex items-center ${props.class}`}>
      <Icon class="text-xl text-neutral-300" icon={searchIcon}></Icon>
      <input class={`p-2 `} type="text" />
    </div>
  );
};

function Button({
  children,
  icon,
  iconSize = 18,
  onClick,
}: {
  children?: JSX.Element;
  icon?: IconifyIcon;
  iconSize?: number;
  onClick?: (e: MouseEvent) => void;
}) {
  return (
    <div
      class="w-fit py-2 px-2.5 min-w-[48px] bg-neutral-200 cursor-pointer rounded flex items-center justify-center"
      onClick={onClick}
    >
      {icon && (
        <Icon
          class="pr-1"
          style={{ "font-size": `${iconSize}px` }}
          icon={icon}
        ></Icon>
      )}
      {children}
    </div>
  );
}

const MainTopBar: Component = () => {
  return (
    <div class="flex items-center">
      <Button icon={plusIcon}>添加</Button>
      <div class="flex-grow"></div>
      <SearchBar class="border-b border-b-neutral-300"></SearchBar>
    </div>
  );
};

const RecordItem: Component = () => {
  return <div></div>;
};

const RecordBody: Component = () => {
  const [lifeRecordState, setLifeRecordState] = useLifeRecordState();
  return (
    <div>
      <For each={lifeRecordState.curr_page_records}>
        {(it, i) => <RecordItem></RecordItem>}
      </For>
    </div>
  );
};

function AppMain() {
  return (
    <main class="bg-white p-4 flex flex-col">
      <MainTopBar></MainTopBar>
      <RecordBody></RecordBody>
    </main>
  );
}

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  async function init() {
    const [lifeRecordState, setLifeRecordState] = useLifeRecordState();
    const records = await life_record_db.get_all();
    setLifeRecordState((it) => {
      it.curr_page_records = records;
      return it;
    });
  }

  init()

  return (
    <div class="bg-neutral-100 w-full h-full p-6 flex flex-col gap-4">
      <div class="text-2xl font-bold">我的生活记录</div>
      <AppMain></AppMain>
    </div>
  );
}

export default App;
