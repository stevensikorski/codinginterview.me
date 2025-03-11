export default function Footer() {
  return (
    <footer className="px-4 py-12 bg-dark">
      <div className="container mx-auto">
        <div className="max-w-[1300px] mx-auto pb-8">
          <div className="max-w-[400px]">
            <h2 className="text-[17px] font-semibold text-light">codinginterview.me</h2>
            <div className="space-y-2.5 pt-3">
              <p className="text-xs text-light">description</p>
              <p className="font-semibold text-sm text-light">codinginterview@gmail.com</p>
              <p className="font-semibold text-sm text-light">+1-800-123 4567</p>
            </div>
          </div>
        </div>
        <div className="max-w-[1135px] mx-auto">
          <div className="flex justify-between items-center gap-4">
            <p className="text-[11px] leading-tight text-light"></p>
            <div className="flex gap-2.5 items-center">
              <div className="size-6 flex justify-center items-center rounded-md bg-light">
                <img src="/twitter.svg" alt="twitter.svg" />
              </div>
              <div className="size-6 flex justify-center items-center rounded-md bg-light">
                <img src="/gmail.svg" alt="gmail.svg" />
              </div>
              <div className="size-6 flex justify-center items-center rounded-md bg-light">
                <img src="/instagram.svg" alt="instagram.svg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}