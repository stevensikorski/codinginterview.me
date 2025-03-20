import React from "react";

export default function Header({ openModal }) {
  return (
    <header className="bg-light py-3 px-4">
      <div className="container mx-auto">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex justify-between items-center">
            {/*logo*/}
            <a href="/" className="text-2xl font-semibold text-dark">
              <figure>
                <img
                  className="size-28 object-contain"
                  src="/logo.webp"
                  alt="logo.webp"
                />
              </figure>
            </a>
            
            {/*desktop navigation*/}
            <nav>
              <div className="flex flex-row gap-14">
                <ul className="flex flex-row gap-10 items-center">
                  {/*home link*/}
                  <li className="group/link active relative">
                    <a
                      href="/"
                      className="text-[13px] text-dark-100 leading-tight hover:font-bold group-[.active]/link:font-bold transition-all"
                    >
                      HOME
                    </a>
                  </li>
                  {/*sign in button - opens login popup*/}
                  <li>
                    <button
                      type="button"
                      onClick={openModal}
                      className="px-10 py-3 rounded-md bg-primary text-[15px] leading-tight font-bold text-light inline-block"
                    >
                      Sign in
                    </button>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}