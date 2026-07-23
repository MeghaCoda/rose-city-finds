export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-[22px] font-medium text-text-primary mb-8">About</h1>

      <section className="mb-10">
        <h2 className="text-lg font-medium text-text-primary mb-3">About Rose City Finds</h2>
        <p className="text-[15px] text-text-primary leading-relaxed">
         The idea for this site came to me during the November 2025 suspension of SNAP 
         benefits during the US government shutdown. Here in Portland I saw dozens of people 
         posting links to different food resources, including an outpouring of free food from 
         local restaurants. However, the information was being served piecemeal in facebook 
         groups and threads. There was no single place where people could consolidate this 
         information.  I&apos;d spent a good portion of my career building search and filtering tools for startups 
         and Fortune 500 companies, and I realized I could build this on my own. And so Rose City Finds was born.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-medium text-text-primary mb-3">About Meghan Yee</h2>
        <p className="text-[15px] text-text-primary leading-relaxed">
          I&apos;ve been a software engineer for over 15 years. A former New Yorker,
          I&apos;ve called Portland, Oregon my home since 2017. I live with my husband,
          our daughter, a very demanding cat and an equally ornery tortoise. 
          You can find me on <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/meghan-yee/">Linkedin</a>. 
        </p>
      </section>
    </main>
  )
}
