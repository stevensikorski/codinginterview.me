export default function SolveProblem() {
  return (
    <section className="px-4 py-10 bg-dark">
      <div className="container mx-auto">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 gap-20 items-center">
            <div className="ml-auto">
              <div className="space-y-2 max-w-[390px]">
                <h3 className="text-[36px] leading-tight text-light font-bold">
                  Solve Real Problems
                </h3>
                <p className="text-[28px] pr-2 !leading-tight text-light font-medium">
                  The interviewer selects a coding problem from a curated pool,
                  and the interviewee solves it in a cloud-based IDE while
                  communicating over video.
                </p>
              </div>
            </div>
            <div className="">
              <figure>
                <img className="w-full" src="/image-2.png" alt="image-2.png" />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}