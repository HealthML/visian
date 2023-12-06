import { ButtonParam, List, Modal } from "@visian/ui-shared";
import { Fragment, useCallback } from "react";
import styled from "styled-components";

import { FormsSheetProps } from "./forms-sheet.props";
import { Questionaire } from "./questionaire";

const FormsSheetContainer = styled(Modal)`
  width: 300px;
  height: 80%;
  overflow-y: auto;
`;

const StyledForm = styled.form`
  width: 100%;
`;

const InlineRow = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 15px;
`;

const SubmitButton = styled(ButtonParam)`
  width: auto;
`;

export const FormsSheet: React.FC<FormsSheetProps> = ({ jsonData }) => {
  const handleFormSubmit = useCallback(() => {
    // TODO implements the correct functionality
    console.log("sumbitted");
  }, []);

  return (
    <FormsSheetContainer>
      <StyledForm onSubmit={handleFormSubmit}>
        <List>
          {jsonData.map((questionaire, index) => (
            <Fragment key={questionaire.id}>
              <Questionaire
                text={questionaire.text}
                type={questionaire.type}
                options={questionaire.options}
                questionaireIndex={index}
              />
            </Fragment>
          ))}
        </List>
        <InlineRow>
          <SubmitButton type="submit" labelTx="submit-form" />
        </InlineRow>
      </StyledForm>
    </FormsSheetContainer>
  );
};
