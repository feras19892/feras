-- Add solver metadata to math equations
ALTER TABLE math_equations ADD COLUMN operation TEXT DEFAULT 'solve';
ALTER TABLE math_equations ADD COLUMN variable TEXT DEFAULT 'x';
ALTER TABLE math_equations ADD COLUMN input_template TEXT;
