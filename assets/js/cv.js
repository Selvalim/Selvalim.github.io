document.getElementById('print-cv').addEventListener('click', function () {
  window.print();
});

(function () {
  var button = document.getElementById('export-cv');
  var status = document.getElementById('cv-export-status');
  var dependencies;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = function () { script.remove(); reject(new Error('PDF resources could not be loaded.')); };
      document.head.appendChild(script);
    });
  }
  button.addEventListener('click', async function () {
    button.disabled = true;
    status.textContent = 'Preparing your PDF…';
    try {
      if (!dependencies) {
        dependencies = loadScript(button.dataset.libraryBase + 'pdfmake.min.js')
          .then(function () { return loadScript(button.dataset.libraryBase + 'vfs_fonts.js'); });
      }
      await dependencies;
      var portraitResponse = await fetch(document.querySelector('.cv-portrait').src);
      if (!portraitResponse.ok) throw new Error('Portrait could not be loaded.');
      var portraitBlob = await portraitResponse.blob();
      var portraitData = await new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(portraitBlob);
      });
      var definition = window.buildAcademicCV(document, portraitData);
      var pdf = window.pdfMake.createPdf(definition);
      var blob = await new Promise(function (resolve) { pdf.getBlob(resolve); });
      var url = URL.createObjectURL(blob);
      var download = document.createElement('a');
      download.href = url;
      download.download = 'Xiaolin-Wen-Academic-CV.pdf';
      document.body.appendChild(download);
      download.click();
      download.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      status.textContent = 'PDF ready. Your download includes all publications and current CV information.';
    } catch (error) {
      dependencies = null;
      status.textContent = 'PDF download failed. Please retry or use Print in your browser.';
    } finally {
      button.disabled = false;
    }
  });
})();
