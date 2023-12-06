import { InvisibleButton, List, Text, TextField } from "@visian/ui-shared";
import { useCallback, useState } from "react";
import styled from "styled-components";

enum QuestionaireType {
  TextInput = "textInput",
  MultipleChoice = "multipleChoice",
}

const QuestionaireContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: space-between;
  width: 100%;
  margin: 15px 5px;
`;

const QuestionaireText = styled(Text)`
  padding: 20px 0px;
`;

const RowText = styled(Text)`
  margin-right: auto;
`;

const TextInput = styled(TextField)`
  margin-right: 10px;
  width: calc(100% - 10px);
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 10px 10px 0;
`;

export const Questionaire = ({
  text,
  type,
  questionaireIndex,
  options,
}: {
  type: string;
  text: string;
  questionaireIndex: number;
  options?: string[];
}) => {
  const [checkList, setCheckList] = useState<boolean[][]>([]);
  const [answer, setAnswer] = useState("");

  const handleCheck = useCallback(
    (rowIndex: number, optionIndex: number) => {
      const updatedCheckList = [...checkList];

      if (!updatedCheckList[rowIndex]) {
        updatedCheckList[rowIndex] = [];
      }

      updatedCheckList[rowIndex][optionIndex] =
        !updatedCheckList[rowIndex][optionIndex];

      setCheckList(updatedCheckList);
    },
    [checkList],
  );

  const updateAnswer = useCallback(
    (e) => {
      setAnswer(e.target.value);
    },
    [setAnswer],
  );

  return (
    <QuestionaireContainer>
      <QuestionaireText text={text} />
      {type === QuestionaireType.TextInput && (
        <TextInput
          autoFocus
          value={answer}
          onChange={updateAnswer}
          placeholderTx="questionaire-text"
        />
      )}
      {type === QuestionaireType.MultipleChoice && options && (
        <List>
          {options.map((optionText, optionIndex) => (
            <Row>
              <RowText text={optionText} />
              <InvisibleButton
                onPointerDown={() =>
                  handleCheck(questionaireIndex, optionIndex)
                }
                icon={
                  checkList[questionaireIndex]?.[optionIndex]
                    ? "checked"
                    : "unchecked"
                }
              />
            </Row>
          ))}
        </List>
      )}
    </QuestionaireContainer>
  );
};
