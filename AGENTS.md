<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- AI calls go through @lovable.dev/ai-gateway inside admin-checked server functions (src/lib/*.functions.ts) — keeps prompts and keys server-side.
- Product CSV exports use a separate admin view and browser-side serializer with paginated reads, all stored fields, and full image URLs; prepare the file before the download click to preserve browser download activation.
