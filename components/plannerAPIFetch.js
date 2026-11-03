async function handle(){

const res = await fetch("/api/plannerFetch");
      const data = await res.json();
      const body = data.map((e) => ({
        id:e.id,
        subject:e.subject,
        title:e.title,
        kind:e.kind,
        time:e.time,
        level:e.level
      })
        )
  return body 
        }
