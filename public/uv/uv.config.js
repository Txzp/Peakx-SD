/*global Ultraviolet*/
// La base se calcula sola, asi funciona en cualquier carpeta o dominio.
(function () {
  var base = (typeof document !== "undefined" && document.currentScript)
    ? new URL("../", document.currentScript.src).pathname   // pagina: este archivo esta en /uv/
    : new URL("./", self.location.href).pathname;           // service worker: sw.js esta en la raiz de la app
  self.__uv$config = {
    prefix: base + "service/",
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: base + "uv/uv.handler.js",
    client: base + "uv/uv.client.js",
    bundle: base + "uv/uv.bundle.js",
    config: base + "uv/uv.config.js",
    sw: base + "uv/uv.sw.js",
  };
})();
