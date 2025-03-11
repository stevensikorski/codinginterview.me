export default function Hero({ openRegisterModal }) {
  return (
    <section className="px-4 bg-light py-20">
      <div className="container mx-auto">
        <div className="max-w-[1300px] mx-auto">
          <div className="flex flex-row items-center gap-10">
            {/*left side with text and button*/}
            <div className="flex gap-4 flex-row items-start">
              {/*bar*/}
              <div className="w-[55px] mt-5 h-[3px] bg-primary rounded-full shrink-0"></div>
              
              <div className="space-y-4">
                {/*headline*/}
                <h1 className="font-bold text-[40px] leading-[1.1] text-primary"> 
                  Practice Coding Interviews Like the Real Thing!
                </h1>
                
                {/*description*/}
                <p className="text-base !leading-[28px] text-dark-100/70">
                  Prepare for real-world coding interviews by practicing with
                  friends. Conduct mock interviews with live coding, video
                  calls, and collaborative problem-solving—just like the real
                  thing!
                </p>
                
                {/*register button - opens signup popup*/}
                <div className="pt-2">
                  <button
                    onClick={openRegisterModal}
                    className="inline-block px-8 py-2.5 rounded-md bg-primary text-sm font-bold text-light"
                  >
                    Give it a try
                  </button>
                </div>
              </div>
            </div>
            
            {/*right side with hero image*/}
            <div className="w-[560px] shrink-0">
              <figure>
                <img src="/hero-img.png" alt="hero-img.png" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}