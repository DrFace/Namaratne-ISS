// Sheet ID
export const SHEET_ID = 'INTERNATIONAL';

// PAGE SHEETS
export const SHEETS = {
  HOME: 'HOME',
  OUR_BOATS: 'OUR_BOATS',
  OUR_BOATS_SINGLE: 'OUR_BOATS_SINGLE',
};

export const LANGUAGES = ['en', 'ru', 'am'];

export const LOC = (value) => {
  return (
    <>
      <span
        dangerouslySetInnerHTML={{
          __html: value,
        }}
      />
    </>
  );
};
