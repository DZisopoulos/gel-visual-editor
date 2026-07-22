// jsdom (as installed here) does not implement HTMLDialogElement's imperative
// methods (showModal/close/show) even though it reflects the `open` attribute.
// Polyfill the minimal behavior our components rely on so native <dialog>
// elements can be rendered and interacted with under vitest's jsdom environment.
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.show = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function (
    this: HTMLDialogElement,
    returnValue?: string
  ): void {
    if (returnValue !== undefined) this.returnValue = returnValue
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
