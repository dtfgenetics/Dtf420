(function () {
  'use strict';

  var PINNED_SOURCE = 'f043e16c188d82627efa6a91b7b3db74c4ba7c95';
  var CDN_BASE =
    'https://cdn.jsdelivr.net/gh/dtfgenetics/Weedopolis-strain-Edition@' +
    PINNED_SOURCE +
    '/digital/weedopolis-web/assets/board/v1-master-b64/';
  var PARTS = [
    'part-00.txt',
    'part-01.txt',
    'part-02.txt',
    'part-03.txt',
    'part-04.txt',
    'part-05.txt',
    'part-06.txt',
    'part-07.txt',
    'part-08.txt',
    'part-09.txt',
    'part-10.txt',
    'part-11.txt',
    'part-12.txt'
  ];

  function setStatus(message, warning) {
    var status = document.getElementById('boardAssetStatus');
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('asset-load-warning', Boolean(warning));
    status.classList.toggle('approved-board-note', !warning);
  }

  async function loadApprovedBoard() {
    var board = document.getElementById('board');
    var frame = document.getElementById('boardFrame');
    if (!board || !frame) return;

    try {
      var responses = await Promise.all(
        PARTS.map(function (part) {
          return fetch(CDN_BASE + part, { cache: 'force-cache' }).then(function (response) {
            if (!response.ok) throw new Error('Board asset request failed: ' + response.status);
            return response.text();
          });
        })
      );

      var base64 = responses.join('').replace(/\s+/g, '');
      if (!base64.startsWith('UklGR')) {
        throw new Error('Recovered board payload is not the expected WebP source.');
      }

      board.style.backgroundImage = 'url("data:image/webp;base64,' + base64 + '")';
      frame.dataset.artStatus = 'approved-board';
      setStatus('Approved Weedopolis V1 board artwork loaded. Gameplay tokens and controls are active.', false);
    } catch (error) {
      console.error('Weedopolis approved board load failed', error);
      frame.dataset.artStatus = 'fallback-board';
      setStatus('Approved board artwork could not load. Gameplay remains available on the fallback board.', true);
    }
  }

  window.addEventListener('DOMContentLoaded', loadApprovedBoard, { once: true });
})();
