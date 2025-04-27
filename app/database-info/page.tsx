export default function DatabaseInfoPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Database Options with Vercel</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Database Options Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border p-3 text-left">Database Option</th>
                  <th className="border p-3 text-left">Type</th>
                  <th className="border p-3 text-left">Pros</th>
                  <th className="border p-3 text-left">Cons</th>
                  <th className="border p-3 text-left">Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-3 font-medium">Vercel Postgres</td>
                  <td className="border p-3">SQL</td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Tight integration with Vercel</li>
                      <li>Serverless-friendly</li>
                      <li>Easy setup</li>
                    </ul>
                  </td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Limited free tier</li>
                      <li>Less control over configuration</li>
                    </ul>
                  </td>
                  <td className="border p-3">Small to medium projects directly on Vercel</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">Supabase</td>
                  <td className="border p-3">SQL + BaaS</td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Auth, storage, and realtime features</li>
                      <li>PostgreSQL-based</li>
                      <li>Good free tier</li>
                    </ul>
                  </td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Separate service to manage</li>
                      <li>Learning curve for advanced features</li>
                    </ul>
                  </td>
                  <td className="border p-3">Apps needing auth and realtime features</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">MongoDB Atlas</td>
                  <td className="border p-3">NoSQL</td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Flexible schema</li>
                      <li>Good for JSON data</li>
                      <li>Scalable</li>
                    </ul>
                  </td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Not relational</li>
                      <li>Separate service</li>
                    </ul>
                  </td>
                  <td className="border p-3">Apps with changing data structures</td>
                </tr>
                <tr>
                  <td className="border p-3 font-medium">PlanetScale</td>
                  <td className="border p-3">SQL</td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>MySQL-compatible</li>
                      <li>Serverless design</li>
                      <li>Branch-based workflow</li>
                    </ul>
                  </td>
                  <td className="border p-3">
                    <ul className="list-disc pl-5">
                      <li>Pricing can scale quickly</li>
                      <li>Some MySQL features limited</li>
                    </ul>
                  </td>
                  <td className="border p-3">Production apps needing scalability</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Traditional vs. Serverless Database Architecture</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Traditional Architecture</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Persistent database connection</li>
                <li>Server always running</li>
                <li>Connection pooling</li>
                <li>Predictable performance</li>
                <li>Higher base costs</li>
                <li>Manual scaling</li>
              </ul>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Serverless Architecture</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>On-demand connections</li>
                <li>Cold starts possible</li>
                <li>Pay-per-use model</li>
                <li>Auto-scaling</li>
                <li>Connection limits</li>
                <li>Potential for higher latency</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Database Implementation in Our Project</h2>
          <p className="mb-4">For this strata management system, we've implemented a database to store:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Unit owner information (strata roll)</li>
            <li>Document metadata and storage references</li>
            <li>Levy payment records</li>
            <li>Maintenance requests and work orders</li>
          </ul>
          <p>
            The database is accessed through API routes that handle data operations while maintaining security and
            performance. We've implemented connection pooling and prepared statements to optimize database interactions
            in a serverless environment.
          </p>
        </section>
      </div>
    </div>
  )
}
