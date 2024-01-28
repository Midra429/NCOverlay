export const injectScript = (src: string) => {
  const script = document.createElement('script')
  script.src = src
  document.documentElement.appendChild(script)
}
