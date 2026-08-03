/* ---------- Writing data ----------
   Add each new piece here. It will automatically appear, newest first,
   on the Writing page's full list AND (if it's one of the 3 most recent)
   in the Home page preview — and clicking it opens its own page at
   article.html?slug=... rendered from the `content` blocks below.
   No need to touch any other file.

   The list starts empty on purpose: with nothing in it, Home and
   Writing both automatically show a "Nothing posted yet — coming soon"
   message (that's already built into site.js, nothing to set up here).
   The moment you add one entry below, that message disappears on its
   own on both pages and your real piece shows instead — no extra step,
   nothing else to touch.

   slug     : URL-safe id, e.g. "my-article-title" — used in the link
              article.html?slug=my-article-title
   category : short label, e.g. "Review" | "Deconstruction" | "Essay"
   date     : "YYYY-MM-DD"
   excerpt  : one or two sentences, shown on the preview cards/list
   url      : optional — set this to link out to an EXTERNAL piece
              (e.g. Medium) instead of using the internal article page.
              Leave it "" to use the internal page via `slug` instead.
   content  : array of blocks making up the article page, in order.
              Block types:
                { type: "paragraph", text: "..." }        (html allowed)
                { type: "heading",   text: "..." }
                { type: "image",     src: "", alt: "", caption: "" }
                                     (leave src "" for a placeholder frame)
                { type: "video",     src: "", caption: "" }
                                     (src = an embeddable URL, e.g. a
                                     YouTube/Vimeo embed link; leave ""
                                     for a placeholder frame)
                { type: "code",      language: "csharp", code: "..." }
                { type: "divider" }  (the same section-break mark used
                                     elsewhere on the site)

   Easiest way to add one: open editor.html, fill in the form, copy the
   generated code, and paste it as a new object inside this array. */
window.WRITINGS = [
];
