const dialogs = document.querySelectorAll<HTMLDialogElement>("dialog[data-overlay]");

if (dialogs.length > 0 && typeof HTMLDialogElement === "function") {
  document.querySelectorAll<HTMLAnchorElement>("a[data-overlay-open]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const dialog = document.getElementById(link.dataset.overlayOpen ?? "");
      if (!(dialog instanceof HTMLDialogElement)) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

      event.preventDefault();
      dialog.showModal();
      dialog.querySelector(".overlay-dialog__scroll")?.scrollTo({ top: 0 });
      document.documentElement.setAttribute("data-dialog-open", "");
    });
  });

  dialogs.forEach((dialog) => {
    dialog
      .querySelector<HTMLButtonElement>("[data-overlay-close]")
      ?.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      document.documentElement.removeAttribute("data-dialog-open");
    });
  });
}
