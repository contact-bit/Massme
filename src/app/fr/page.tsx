import HomePage from "../(public)/[locale]/page";

export default function FrenchHome() {
  return <HomePage params={Promise.resolve({ locale: "fr" })} />;
}
