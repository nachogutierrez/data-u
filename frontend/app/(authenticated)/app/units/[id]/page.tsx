export default async function UnitDetailsPage({ params }: { params: { id: string } }) {

    const { id }: { id: string } = params

    return (
        <main>
            <h2>UnitDetailsPage for id {id}</h2>
        </main>
    )
}
