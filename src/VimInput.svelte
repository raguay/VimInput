<script>
  import { tick } from "svelte";

  let { value = $bindable(), oneline, oninput, style } = $props();

  let inp = $state(null);
  let mode = $state("insert");
  let pos = $state(value.length);
  let posvb = $state(0);
  let theme = {
    modes: [
      {
        name: "normal",
        color: "blue",
        text: "white",
      },
      {
        name: "insert",
        color: "yellow",
        text: "black",
      },
      {
        name: "visual",
        color: "green",
        text: "purple",
      },
    ],
  };

  function getModeColor() {
    return theme.modes.find((nm) => nm.name === mode).color;
  }

  function getModeTextColor() {
    return theme.modes.find((nm) => nm.name === mode).text;
  }

  function sendValue() {
    oninput(value);
  }

  function moveCursorTo(loc) {
    inp.setSelectionRange(loc, loc);
  }

  function removeChar(ps) {
    value = value.slice(0, ps - 1) + value.slice(ps);
  }

  function createSelection(field, start, end) {
    if (field.createTextRange) {
      let selRange = field.createTextRange();
      selRange.collapse(true);
      selRange.moveStart("character", start);
      selRange.moveEnd("character", end - start);
      selRange.select();
    } else if (field.setSelectionRange) {
      field.setSelectionRange(start, end);
    } else if (field.selectionStart) {
      field.selectionStart = start;
      field.selectionEnd = end;
    }
    field.focus();
  }
</script>

<!-- svelte-ignore a11y_mouse_events_have_key_events, a11y_no_static_element_interactions -->
<div
  id="container"
  onmouseover={() => {
    inp.focus();
  }}
  style="flex-direction: {oneline ? 'row' : 'column'}; {style}"
>
  {#if oneline}
    <span
      id="mode"
      style="border-radius: 5px 0px 0px 5px; font-family: monospace; background-color: {getModeColor()}; color: {getModeTextColor()}; border: 0px solid {getModeColor()};"
    >
      {mode}
    </span>
  {/if}
  <input
    bind:this={inp}
    bind:value
    {style}
    onkeydown={async (e) => {
      switch (mode) {
        case "insert":
          switch (e.key) {
            case "Enter":
              e.preventDefault();
              e.stopPropagation();
              sendValue();
              break;
            case "Escape":
              e.preventDefault();
              e.stopPropagation();
              mode = "normal";
              break;
            case "Backspace":
              pos--;
              if (pos < 0) pos = 0;
              break;
            case "Delete":
              pos--;
              if (pos < 0) pos = 0;
              break;
            default:
              //
              // Add to the number of characters added. TODO: fix. Very very bad logic, but it works.
              //
              pos++;
              if (pos > value.length) pos = value.length;
              break;
          }
          break;

        case "normal":
          e.preventDefault();
          e.stopPropagation();
          switch (e.key) {
            case "x":
              removeChar(pos);
              await tick();
              moveCursorTo(--pos);
              break;
            case "Enter":
              sendValue();
              break;
            case "Escape":
              break;
            case "v":
              mode = "visual";
              posvb = pos;
              break;
            case "i":
              mode = "insert";
              break;
            case "G":
            case "$":
              pos = value.length;
              moveCursorTo(pos);
              break;
            case "g":
            case "0":
            case "^":
              pos = 0;
              moveCursorTo(pos);
              break;
            case "r":
              removeChar(pos);
              await tick();
              moveCursorTo(--pos);
              mode = "insert";
              break;
            case "h":
              pos--;
              if (pos < 0) pos = 0;
              moveCursorTo(pos);
              break;
            case "l":
              pos++;
              if (pos > value.length) pos = value.length;
              moveCursorTo(pos);
              break;
          }
          break;

        case "visual":
          e.preventDefault();
          e.stopPropagation();
          switch (e.key) {
            case "Escape":
              mode = "normal";
              break;
            case "h":
              pos = pos - 1;
              if (pos < 0) pos = 0;
              // Select a portion of text
              if (posvb >= pos) createSelection(inp, pos, posvb);
              else createSelection(inp, posvb, pos);
              break;
            case "l":
              pos = pos + 1;
              if (pos > value.length) pos = value.length;
              // Select a portion of text
              if (posvb >= pos) createSelection(inp, pos, posvb);
              else createSelection(inp, posvb, pos);
              break;
          }
          break;
      }
    }}
  />
  {#if !oneline}
    <div id="inforow">
      <span
        id="mode"
        style="border-radius: 0px 0px 5px 5px; font-family: monospace; background-color: {getModeColor()}; color: {getModeTextColor()}; border: 0px solid {getModeColor()}"
      >
        {mode}
      </span>
      <span id="position">position: {pos}</span>
    </div>
  {/if}
</div>

<style>
  #container {
    display: flex;
    user-select: none;
    border-radius: 5px;
    margin: 0px;
    padding: 0px;
  }

  #container input {
    width: 100%;
  }

  input:focus {
    outline: none;
  }

  #inforow {
    display: flex;
    flex-direction: row;
    user-select: none;
    margin: 0px;
    padding: 0px;
  }

  #mode {
    user-select: none;
    padding: 3px 5px 5px 5px;
    margin: 0px;
  }

  #position {
    border-radius: 0px 0px 5px 5px;
    user-select: none;
    padding: 3px 5px 5px 5px;
    margin: 0px 0px 0px auto;
  }
</style>
