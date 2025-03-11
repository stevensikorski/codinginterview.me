export default function FindPartner() {
  return (
    <section className="px-4 py-14 bg-light">
      <div className="container mx-auto">
        <div className="max-w-[1050px] mx-auto">
          <div className="grid grid-cols-2">
            <div className="">
              <figure>
                <img className="w-full" src="/image-1.png" alt="image-1.png" />
              </figure>
            </div>
            <div className="pl-14 space-y-5">
              <div className="space-y-2 max-w-[390px]">
                <h3 className="text-[36px] leading-tight text-dark font-bold">
                  Find a Partner
                </h3>
                <p className="text-[28px] !leading-tight text-dark font-medium">
                  Connect with a friend or another student looking to practice
                  coding interviews.
                </p>
              </div>
              <div className="space-y-2 max-w-[390px]">
                <h3 className="text-[36px] leading-tight text-dark font-bold">
                  Start a Live Interview
                </h3>
                <p className="text-[28px] !leading-tight text-dark font-medium">
                  interviewer while the other takes on the role of the
                  interviewee.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}