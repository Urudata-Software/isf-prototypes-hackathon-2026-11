def build_summarize_prompt(title: str, content: str) -> str:
    return (
        "Summarize this document in two sentences for someone deciding whether it "
        "needs attention. Lead with what matters. Reply in the language of the "
        "document.\n\n"
        f"Title: {title}\n\n"
        f"{content}"
    )
