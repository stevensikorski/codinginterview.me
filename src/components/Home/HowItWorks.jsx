export default function HowItWorks() {
  return (
    <section className="px-4 py-14 bg-dark">
      <div className="container mx-auto">
        <div className="max-w-[1145px] mx-auto space-y-4">
          <h2 className="text-center text-[25px] text-light font-bold">
            How it works
          </h2>
          <ul className="grid gap-0.5 list-decimal">
            <li className="text-light text-2xl font-bold ">
               Find a Partner – <span className="font-normal"> Connect with a friend or
              another student looking to practice coding interviews.</span>
            </li>
            <li className="text-light text-2xl font-bold">
              Start a Live Interview - <span className="font-normal">  One person acts as the interviewer while the other takes on the role of the interviewee.</span>
            </li>
            <li className="text-light text-2xl font-bold">
            Solve Real Problems – <span className="font-normal">  The interviewer selects a coding problem from a curated pool, and the interviewee solves it in a cloud-based IDE while communicating over video.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}