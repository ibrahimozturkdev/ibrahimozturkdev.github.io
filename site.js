/* ---------- Theme toggle ----------
   The initial theme is applied by a tiny inline script in <head> on
   every page, before first paint — that's what avoids the flash when
   navigating between pages. This block only keeps the toggle button's
   own icon/label in sync and persists a manual switch to localStorage
   (falls back gracefully if storage is blocked, e.g. a sandboxed
   preview — the switch just won't survive a full reload there). */
(function(){
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  if(!btn) return;
  var label = btn.querySelector('.theme-toggle-label');
  var icon = btn.querySelector('.theme-toggle-icon');
  var STORAGE_KEY = 'ozturk-portfolio-theme';

  function writeStored(theme){
    try{ localStorage.setItem(STORAGE_KEY, theme); }
    catch(e){ /* storage unavailable — theme just won't persist here */ }
  }

  function syncButton(theme){
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    if(label) label.textContent = theme === 'dark' ? 'Light' : 'Dark';
    if(icon) icon.textContent = theme === 'dark' ? '☀' : '☾';
  }

  syncButton(root.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    syncButton(next);
    writeStored(next);
  });
})();

/* ---------- Writing data ----------
   window.WRITINGS now lives in marquee.js, which every page loads early
   (in <head>) so the top ticker can show its final text on the first
   frame instead of flashing a static placeholder and swapping it out.
   Edit entries there — everything below just reads window.WRITINGS. */

/* ---------- Writing render helpers ---------- */
(function(){
  function sortedWritings(){
    return (window.WRITINGS || []).slice().sort(function(a, b){
      return new Date(b.date) - new Date(a.date);
    });
  }

  function formatDate(d){
    var date = new Date(d);
    if(isNaN(date.getTime())) return d;
    return date.toLocaleDateString('en-US', { year:'numeric', month:'short' });
  }

  function escapeHtml(str){
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function emptyState(){
    var el = document.createElement('div');
    el.className = 'writing-empty';
    el.innerHTML =
      '<div class="eyebrow">Writing — coming soon</div>' +
      '<h3>Nothing posted yet.</h3>' +
      '<p>Reviews, essays, and deconstruction breakdowns will land here.</p>';
    return el;
  }

  function tagClass(index){
    return index % 2 === 0 ? 'tag tag--dark' : 'tag tag--pink';
  }

  // Where a piece links to: an external url if set, otherwise its own
  // internal article page via slug, otherwise nowhere (not clickable).
  function linkFor(item){
    if(item.url) return { href: item.url, external: true };
    if(item.slug) return { href: 'article.html?slug=' + encodeURIComponent(item.slug), external: false };
    return null;
  }

  function cardEl(item, index){
    var link = linkFor(item);
    var el = document.createElement(link ? 'a' : 'div');
    el.className = 'card';
    if(link){
      el.href = link.href;
      if(link.external){ el.target = '_blank'; el.rel = 'noopener'; }
    }
    el.innerHTML =
      '<span class="' + tagClass(index) + '">' + escapeHtml(item.category) + '</span>' +
      '<h3>' + escapeHtml(item.title) + '</h3>' +
      '<div class="meta">' + formatDate(item.date) + '</div>' +
      '<p class="desc">' + escapeHtml(item.excerpt) + '</p>';
    return el;
  }

  function rowEl(item, index){
    var row = document.createElement('div');
    row.className = 'writing-row';
    var link = linkFor(item);
    var readLink = '';
    if(link){
      readLink = '<a class="read-link" href="' + link.href + '"' +
        (link.external ? ' target="_blank" rel="noopener"' : '') +
        '>Read \u2192</a>';
    }
    row.innerHTML =
      '<div class="writing-meta"><span class="' + tagClass(index) + '">' + escapeHtml(item.category) + '</span><br>' + formatDate(item.date) + '</div>' +
      '<div><h3>' + escapeHtml(item.title) + '</h3><p class="excerpt">' + escapeHtml(item.excerpt) + '</p>' + readLink + '</div>';
    return row;
  }

  window.renderWritingPreview = function(containerId, limit){
    var container = document.getElementById(containerId);
    if(!container) return;
    var items = sortedWritings();
    if(items.length === 0){ container.appendChild(emptyState()); return; }
    var grid = document.createElement('div');
    grid.className = 'card-grid cols-3';
    items.slice(0, limit).forEach(function(item, i){ grid.appendChild(cardEl(item, i)); });
    container.appendChild(grid);
  };

  window.renderWritingList = function(containerId){
    var container = document.getElementById(containerId);
    if(!container) return;
    var items = sortedWritings();
    if(items.length === 0){ container.appendChild(emptyState()); return; }
    var list = document.createElement('div');
    list.className = 'writing-list';
    items.forEach(function(item, i){ list.appendChild(rowEl(item, i)); });
    container.appendChild(list);
  };

  /* ---------- Single article page ----------
     Reads ?slug=... from the URL, finds the matching WRITINGS entry,
     and renders its title/meta/content blocks into the given containers. */
  function renderBlock(block){
    var el = document.createElement('div');
    switch(block.type){
      case 'paragraph':
        el.className = 'article-p';
        el.innerHTML = block.text || '';
        return el;
      case 'heading':
        el.className = 'article-h';
        el.textContent = block.text || '';
        return el;
      case 'divider':
        el.className = 'section-break';
        el.setAttribute('aria-hidden', 'true');
        el.innerHTML = '<span class="rule"></span><span class="marks"><i></i><i></i><i></i></span><span class="rule"></span>';
        return el;
      case 'image':
        el.className = 'media-frame' + (block.src ? '' : ' placeholder');
        el.innerHTML = block.src
          ? '<img src="' + escapeHtml(block.src) + '" alt="' + escapeHtml(block.alt || '') + '">'
          : '<span class="placeholder-label"><span class="play">\uD83D\uDDBC</span> Image coming soon</span>';
        if(block.caption){
          var wrap = document.createElement('div');
          wrap.appendChild(el);
          var cap = document.createElement('div');
          cap.className = 'media-caption';
          cap.textContent = block.caption;
          wrap.appendChild(cap);
          return wrap;
        }
        return el;
      case 'video':
        el.className = 'media-frame' + (block.src ? '' : ' placeholder');
        el.innerHTML = block.src
          ? '<iframe src="' + escapeHtml(block.src) + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>'
          : '<span class="placeholder-label"><span class="play">\u25B6</span> Video coming soon</span>';
        if(block.caption){
          var vwrap = document.createElement('div');
          vwrap.appendChild(el);
          var vcap = document.createElement('div');
          vcap.className = 'media-caption';
          vcap.textContent = block.caption;
          vwrap.appendChild(vcap);
          return vwrap;
        }
        return el;
      case 'code':
        if(/blueprint/i.test(block.language || '') && window.renderBlueprintGraph){
          var bpWrap = document.createElement('div');
          bpWrap.className = 'bp-block';
          var head = document.createElement('div');
          head.className = 'bp-block-head';
          head.innerHTML = '<span class="code-label">BLUEPRINT</span>';
          var copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.className = 'bp-copy-btn';
          copyBtn.textContent = 'Copy';
          copyBtn.addEventListener('click', function(){
            var codeText = block.code || '';
            var originalLabel = 'Copy';
            function done(){ copyBtn.textContent = 'Copied \u2713'; setTimeout(function(){ copyBtn.textContent = originalLabel; }, 1500); }
            if(navigator.clipboard && navigator.clipboard.writeText){
              navigator.clipboard.writeText(codeText).then(done, function(){ alert('Could not copy automatically — select the block manually.'); });
            }
          });
          head.appendChild(copyBtn);
          bpWrap.appendChild(head);
          var graphContainer = document.createElement('div');
          var parsed = window.renderBlueprintGraph(block.code || '', graphContainer);
          if(parsed){
            bpWrap.appendChild(graphContainer);
            return bpWrap;
          }
        }
        el.className = 'code-block';
        el.innerHTML =
          '<div class="code-label">' + escapeHtml(block.language || 'code') + '</div>' +
          '<pre><code>' + escapeHtml(block.code || '') + '</code></pre>';
        return el;
      default:
        return null;
    }
  }

  function notFound(){
    var el = document.createElement('div');
    el.className = 'writing-empty';
    el.innerHTML =
      '<div class="eyebrow">Not found</div>' +
      '<h3>This piece isn\u2019t here.</h3>' +
      '<p>The article you\u2019re looking for doesn\u2019t exist or was moved. <a class="read-link" href="writing.html">Back to Writing \u2192</a></p>';
    return el;
  }

  window.renderArticle = function(metaContainerId, contentContainerId){
    var metaContainer = document.getElementById(metaContainerId);
    var contentContainer = document.getElementById(contentContainerId);
    if(!metaContainer || !contentContainer) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var item = (window.WRITINGS || []).find(function(w){ return w.slug === slug; });

    if(!item){
      metaContainer.innerHTML = '<a href="writing.html" class="btn" style="margin-bottom:32px;">\u2190 All writing</a>';
      contentContainer.appendChild(notFound());
      document.title = 'Not found — İbrahim Öztürk';
      return;
    }

    document.title = item.title.replace(/^\[Example\]\s*/, '') + ' — İbrahim Öztürk';

    metaContainer.innerHTML =
      '<a href="writing.html" class="btn" style="margin-bottom:32px;">\u2190 All writing</a>' +
      '<div class="article-meta"><span class="' + tagClass(0) + '">' + escapeHtml(item.category) + '</span><span class="article-date">' + formatDate(item.date) + '</span></div>' +
      '<h1 class="article-title">' + escapeHtml(item.title) + '</h1>';

    (item.content || []).forEach(function(block){
      var node = renderBlock(block);
      if(node) contentContainer.appendChild(node);
    });
  };

  // Reused by editor.html for a pixel-accurate live preview, and for
  // building the article-meta header the same way renderArticle does.
  window.renderContentBlock = renderBlock;
  window.escapeHtmlText = escapeHtml;
  window.tagClassFor = tagClass;
  window.formatWritingDate = formatDate;
})();
