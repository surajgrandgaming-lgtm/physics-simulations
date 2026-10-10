import SubjectPage from "./[subject]/page";

export default function HomePage() {
  return <SubjectPage params={Promise.resolve({ subject: "physics" })} />;
}
