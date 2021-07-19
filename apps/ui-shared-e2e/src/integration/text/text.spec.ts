describe("ui-shared: Text component", () => {
  beforeEach(() => cy.visit("/iframe.html?id=text--primary"));

  it("should render the component", () => {
    cy.get("span").should("contain", "This is an example text.");
  });
});
