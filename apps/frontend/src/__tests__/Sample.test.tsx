import { render, screen } from "@testing-library/react";

describe("Sample test", () => {
  it("affiche un texte de test", () => {
    render(<div>Test réussi !</div>);
    expect(screen.getByText(/test réussi/i)).toBeInTheDocument();
  });
});
