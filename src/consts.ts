export const appConfig = {
  PORT: process.env.PORT,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL: process.env.EMAIL,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  VALIDITY_MINUTE_MAIL: process.env.VALIDITY_MINUTE_MAIL,
  CLIENT_BASE_URL: process.env.CLIENT_BASE_URL,
  VERIFY_URL: process.env.VERIFY_URL,
};

export const error = {
  422: "Validasiya Xətası!",
  409: "Bu istifadəçi artıq mövcuddur!",
  500: "Server xətası!",
  404: "Bu istifadəçi tapılmadı",
  403: "İcazəniz yoxdur",
  400: "Səhv sorğu! Tələb olunan məlumat çatışmır və ya yanlışdır.",
  401: "Doğrulama xətası! Giriş etibarsızdır və ya parol yanlışdır.",
};