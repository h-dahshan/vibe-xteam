import { render, screen } from "@testing-library/react";

import App from "./App";

test("App", () => {
  render(<App />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Hello There!" })
  ).toBeDefined();
});
