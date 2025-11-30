export function useColoredText(text: string | null | undefined): string {
    if (!text) return ''

    text = text
        .replace(/\*\*\*\*/g, '</span><span style="color:#009432;">')
        .replace(/\*\*\*/g, '</span><span style="color:blue;">')
        .replace(/\*\*/g, '</span><span style="color:red;">')
        .replace(/\*/g, '</span><span style="color:inherit;">')

    return `<span>${text}</span>`
}