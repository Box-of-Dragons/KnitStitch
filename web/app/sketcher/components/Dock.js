import {createElement} from "../../utils/domUtils";

export class Dock {

  constructor(dockEl, viewDefinitions) {
    this.views = {};
    this.dockEl = dockEl;
    for (let i = 0; i < viewDefinitions.length; i++) {
      const viewDef = viewDefinitions[i];
      const view = {};
      this.views[viewDef.name] = view;
      view.node = createElement('div', undefined, 'dock-node collapsed');
      view.collapsed = true;
      const caption = createElement('div', undefined, 'tool-caption accordion-caption');
      caption.appendChild(createElement('i', undefined, 'fa fa-caret-right accordion-caret'));
      caption.appendChild(createElement('span', undefined, 'txt', viewDef.name.toUpperCase()));
      caption.addEventListener('click', () => {
        if (this.isVisible(viewDef.name)) {
          this.hide(viewDef.name);
        } else {
          this.show(viewDef.name);
        }
      });
      view.node.appendChild(caption);
      this.dockEl.appendChild(view.node);
    }
  }

  show(viewName) {
    const view = this.views[viewName];
    if (!view.collapsed) {
      return;
    }
    view.collapsed = false;
    view.node.classList.remove('collapsed');
    const caret = view.node.querySelector('.accordion-caret');
    if (caret) {
      caret.classList.remove('fa-caret-right');
      caret.classList.add('fa-caret-down');
    }
  }

  hide(viewName) {
    const view = this.views[viewName];
    if (view.collapsed) {
      return;
    }
    view.collapsed = true;
    view.node.classList.add('collapsed');
    const caret = view.node.querySelector('.accordion-caret');
    if (caret) {
      caret.classList.remove('fa-caret-down');
      caret.classList.add('fa-caret-right');
    }
  }


  isVisible(viewName) {
    return !this.views[viewName].collapsed;
  }

  setState(state) {
    state.forEach(viewName => this.show(viewName));
  }

  getState() {
    const state = [];
    Object.keys(this.views).forEach(viewName => {
      if (this.isVisible(viewName)) {
        state.push(viewName);
      }
    });
    return state;
  }

}

export function dockBtn(name, icon) {
  const btn = createElement('span', undefined, 'dock-btn');
  btn.appendChild(createElement('i', undefined, 'fa fa-' + icon));
  btn.appendChild(createElement('span', undefined, 'txt', name));
  return btn;
}


