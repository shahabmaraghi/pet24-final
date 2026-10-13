import "jquery";

declare global {
  interface Window {
    $: JQueryStatic;
    jQuery: JQueryStatic;
  }

  interface JQuery {
    owlCarousel(options?: Record<string, unknown>): JQuery;
  }
}

export {};
