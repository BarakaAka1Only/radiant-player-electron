import Diff from 'deep-diff';
import Menu from 'menu';

export const bindMenuActions = (menu, actions) => {
  if (Array.isArray(menu)) return menu.map(item => bindMenuActions(item, actions));

  if (typeof menu !== 'object') throw new Error(`Invalid menu item: ${menu}`);

  const item = { ...menu };

  if (item.click) {
    const action = actions[item.click];
    if (!action) throw new Error(`Invalid click action name ${item.click}`);
    item.click = action;
  }

  // item.redux is used to find certain items but isn't necessary for Electron
  if (item.redux) delete item.redux;

  if (item.submenu) item.submenu = bindMenuActions(item.submenu, actions);

  return item;
};

const mutableFields = ['enabled', 'checked', 'visible'];

export default class MenuRenderer {
  constructor(actions = {}) {
    this.actions = actions;
    this.previousMenu = false;
    this.applicationMenu = false;
  }

  render(nextMenu) {
    if (nextMenu === this.previousMenu) return;

    if (this.previousMenu) {
      const diff = Diff.diff(this.previousMenu, nextMenu);
      this.previousMenu = nextMenu;

      // No items have changed, return
      if (diff === undefined) return;

      if (!this._needsFullRender(diff)) {
        this._applyDiff(diff);
        return;
      }
    } else {
      this.previousMenu = nextMenu;
    }

    const template = bindMenuActions(nextMenu, this.actions);
    this.applicationMenu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(this.applicationMenu);
  }

  _needsFullRender(diff) {
    if (!this.previousMenu || !this.applicationMenu) return true;

    for (const action of diff) {
      if (action.kind !== 'E') return true;
      if (!mutableFields.includes(action.path[action.path.length - 1])) return true;
    }

    return false;
  }

  _applyDiff(diff) {
    diff.forEach(action => {
      let element = this.applicationMenu.items;

      action.path.slice(0, -1).forEach(key => {
        element = element[key];
        if (key === 'submenu') element = element.items;
      });

      element[action.path[action.path.length - 1]] = action.rhs;
    });
  }
}
