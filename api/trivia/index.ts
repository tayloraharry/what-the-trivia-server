import { IQuestionObject } from 'what-the-trivia-types';
import fetch from 'cross-fetch';

const baseUrl = "https://opentdb.com/api";

interface IQuestionResponse {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

const getToken = async (): Promise<string> => {
  const response = await fetch(`${baseUrl}_token.php?command=request`);
  const data = await response.json();
  return data.token;
};

export const getQuestions = async (): Promise<IQuestionObject[]> => {
  const token = await getToken();
  const response = await fetch(`${baseUrl}.php?amount=10&category=9&difficulty=easy&type=multiple&token=${token}`);
  const data = await response.json();
  const questions: IQuestionObject[] = data.results.map((result: IQuestionResponse) => {
    const { category, type, difficulty, question, correct_answer, incorrect_answers } = result;
    const answers = incorrect_answers.concat([correct_answer]).map(a => {
      return {
        text: a,
        correct: a === correct_answer,
      }
    }).sort( () => Math.random() - 0.5).map((a, index) => {
      return {
        ...a, option: ['A','B','C','D'][index]
      }
    })

    return {
      category,
      type,
      text: question,
      difficulty,
      answers,
    }
  });
  
  return questions;
};