export function useOpenAtd(cb: (content: string) => void) {
    const input = document.createElement('input')
    const reader = new FileReader()

    input.type = 'file'
    input.accept = '.atd'
    input.style.display = 'none'
    document.body.appendChild(input)

    input.onchange = () => {
        const file = input.files?.[0]

        if (!file) return
        
        reader.onload = (event) => {
            const content = event.target?.result
            
            if (typeof content !== 'string') return
            
            try {
                cb({...JSON.parse(content), title: file.name.replace('.atd', '')})
            }
            catch (error) {
                throw new Error('Invalid ATD file: ' + error)
            }
        }
        
        document.body.removeChild(input)
        reader.readAsText(file)
    }

    input.click()
}