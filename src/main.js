import { mount } from "svelte";
import VimInput from "./VimInput.svelte";

const app = mount(VimInput, {
  target: document.getElementById("app"),
  props: {
    value: "testing",
    oneline: true,
    oninput: () => {},
    style: "background-color: lightblue;",
  },
});

export default app;
