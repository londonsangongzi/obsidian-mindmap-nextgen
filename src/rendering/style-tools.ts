import { PluginSettings, settingChanges, settingsReady } from "src/filesystem";
import Plugin from "src/main";


export function toggleBodyClass(setting: keyof PluginSettings, className: string) {
  const fn = yes => yes
    ? document.body.classList.add(className)
    : document.body.classList.remove(className)
  settingChanges.listen(setting, fn);
  settingsReady.then(settings => fn(settings[setting]));
}

export type Trigger = (next: () => void) => void
export const themeChange = next => app.workspace.on("css-change", next);
export const settingTriggers = new Proxy(<Record<keyof PluginSettings, Trigger>>{}, {
  get: (_, key: keyof PluginSettings) => settingChanges.listen(key)
})

export const globalStyle = (() => {
  const styleEl = document.head.createEl('style');

  return { add, registerStyleElement }
  function add(trigger_s: Trigger | Trigger[], getStyleText: () => string, after?: () => void) {
    const section = new Text(getStyleText());
    styleEl.append(section);
    const updateSection = () => {
      section.textContent = getStyleText();
      after?.();
    };
    Array.isArray(trigger_s)
      ? trigger_s.forEach(trigger => trigger(updateSection))
      : trigger_s(updateSection);
  }

  function registerStyleElement(plugin: Plugin) {
    plugin.register(() => styleEl.remove())
  }
})()
