import "jquery";

declare module "owl.carousel";
declare module "jquery/dist/jquery.js";

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
