import HomePage from "../(public)/[locale]/page";

export default function EnglishHome() {
  return <HomePage params={Promise.resolve({ locale: "en" })} />;
}
