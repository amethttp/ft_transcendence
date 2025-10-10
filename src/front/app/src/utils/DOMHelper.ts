export class DOMHelper {
  static uniqueId(prefix?: string): string {
    const _prefix = prefix ? prefix + '-' : '';
    return _prefix + Date.now() + Math.random().toString(36).slice(2, 9);
  }

  static createElementFromHTML(htmlString: string): HTMLElement {
    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();
    const elem = template.content.firstElementChild!;
    if (!elem.hasAttribute("id"))
      elem.setAttribute("id", this.uniqueId());
    return elem as HTMLElement;
  }

  static sanitizeHTML(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }
}