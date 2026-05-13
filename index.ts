import { rx } from "./src";

issues2a();
issues2b();
issues5();

function issues2a() {
  const parser = rx()
    .capture("id", rx().oneOrMore(rx().digit()))
    // Dahulu ini akan menyebabkan 'ext' hilang dari tipe data (any)
    .optional(rx().literal("-").capture("ext", rx().oneOrMore(rx().wordChar())))
    .compile();

  const result = parser.exec("123-beta");

  if (result.isMatch) {
    // 'id' dijamin ada sebagai string
    console.log(result.id.length);

    // 'ext' sekarang terlacak secara otomatis sebagai string | undefined!
    // TypeScript akan memaksa Anda melakukan pengecekan null/undefined
    if (result.ext) {
      console.log(result.ext.toUpperCase());
    }
  }
}

function issues2b() {
  const choice = rx()
    .capture("success", rx().literal("OK"))
    .or(rx().capture("error", rx().literal("FAIL")))
    .compile();

  const res = choice.exec("OK");

  if (res.isMatch) {
    // TypeScript tahu bahwa jika success ada, maka error adalah undefined (dan sebaliknya)
    if (res.success) {
      console.log("Status:", res.success.at(0)); // "OK"
      // console.log(res.error); // undefined
    }
  }
}

function issues5() {
  const builder = rx()
    .capture("quote", rx().anyOf(`'"`))
    .oneOrMore(rx().wordChar())
    // VALID: 'quote' sudah didefinisikan sebelumnya
    .matchPrevious("quote");

  /*
   // INVALID: Ini akan menyebabkan Error Compile di TypeScript!
   // "Argument of type '"wrongName"' is not assignable to parameter of type '"quote"'"
   builder.matchPrevious('wrongName');
   */

  const pattern = builder.compile();
  const match = pattern.exec(`'hello'`);

  if (match.isMatch) {
    console.log(match.quote); // "'"
  }
}
