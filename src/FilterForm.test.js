import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterForm from './FilterForm';

describe('FilterForm', () => {
  const mockOnApplyFilter = jest.fn();
  const mockOnClearFilter = jest.fn();

  const defaultProps = {
    onApplyFilter: mockOnApplyFilter,
    onClearFilter: mockOnClearFilter,
    initialValues: {
      repository: '',
      pathPrefix: '',
      keyword: ''
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields with correct labels', () => {
    render(<FilterForm {...defaultProps} />);

    expect(screen.getByLabelText(/repository did/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/path prefix/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/keyword/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply filter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('shows default value for path prefix', () => {
    render(<FilterForm {...defaultProps} />);

    const pathPrefixInput = screen.getByLabelText(/path prefix/i);
    expect(pathPrefixInput).toHaveValue('app.bsky.feed.post');
  });

  it('loads initial values correctly', () => {
    const initialValues = {
      repository: 'did:plc:test123',
      pathPrefix: 'app.bsky.feed.like',
      keyword: 'test keyword'
    };

    render(<FilterForm {...defaultProps} initialValues={initialValues} />);

    expect(screen.getByLabelText(/repository did/i)).toHaveValue('did:plc:test123');
    expect(screen.getByLabelText(/path prefix/i)).toHaveValue('app.bsky.feed.like');
    expect(screen.getByLabelText(/keyword/i)).toHaveValue('test keyword');
  });

  it('calls onApplyFilter with trimmed values when form is submitted', async () => {
    const user = userEvent.setup();
    render(<FilterForm {...defaultProps} />);

    const repositoryInput = screen.getByLabelText(/repository did/i);
    const pathPrefixInput = screen.getByLabelText(/path prefix/i);
    const keywordInput = screen.getByLabelText(/keyword/i);
    const submitButton = screen.getByRole('button', { name: /apply filter/i });

    await user.clear(repositoryInput);
    await user.type(repositoryInput, ' did:plc:test123 ');
    await user.clear(pathPrefixInput);
    await user.type(pathPrefixInput, ' app.bsky.feed.post ');
    await user.clear(keywordInput);
    await user.type(keywordInput, ' hello world ');

    await user.click(submitButton);

    expect(mockOnApplyFilter).toHaveBeenCalledWith({
      repository: 'did:plc:test123',
      pathPrefix: 'app.bsky.feed.post',
      keyword: 'hello world'
    });
  });

  it('prevents default form submission', async () => {
    const user = userEvent.setup();
    const mockPreventDefault = jest.fn();
    
    render(<FilterForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /apply filter/i });
    
    // Mock the form submission event
    const formElement = submitButton.closest('form');
    const handleSubmit = jest.fn((e) => {
      mockPreventDefault();
      e.preventDefault();
    });
    
    formElement.addEventListener('submit', handleSubmit);
    await user.click(submitButton);

    expect(handleSubmit).toHaveBeenCalled();
    expect(mockOnApplyFilter).toHaveBeenCalled();
  });

  it('clears form and calls onClearFilter when clear button is clicked', async () => {
    const user = userEvent.setup();
    const initialValues = {
      repository: 'did:plc:test123',
      pathPrefix: 'app.bsky.feed.like',
      keyword: 'test keyword'
    };

    render(<FilterForm {...defaultProps} initialValues={initialValues} />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(screen.getByLabelText(/repository did/i)).toHaveValue('');
    expect(screen.getByLabelText(/path prefix/i)).toHaveValue('app.bsky.feed.post'); // Default value
    expect(screen.getByLabelText(/keyword/i)).toHaveValue('');
    expect(mockOnClearFilter).toHaveBeenCalled();
  });

  it('updates input values when user types', async () => {
    const user = userEvent.setup();
    render(<FilterForm {...defaultProps} />);

    const keywordInput = screen.getByLabelText(/keyword/i);
    await user.type(keywordInput, 'test input');

    expect(keywordInput).toHaveValue('test input');
  });

  it('shows helpful text for each input field', () => {
    render(<FilterForm {...defaultProps} />);

    expect(screen.getByText(/filter by specific user\/account/i)).toBeInTheDocument();
    expect(screen.getByText(/filter by operation type/i)).toBeInTheDocument();
    expect(screen.getByText(/use comma-separated keywords/i)).toBeInTheDocument();
  });
});